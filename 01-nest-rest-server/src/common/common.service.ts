import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm'
import { BasePaginationDto } from './dto/base-pagination.dto'
import { BaseModel } from './entities/base.entity'
import { FILTER_MAPPER } from './const/filter-mapper.const'
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from './const/env-keys.const'

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {}

  // **** 1) 페이지네이션
  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions)
    } else {
      return this.cursorPaginate(dto, repository, overrideFindOptions, path)
    }
  }

  // **** 2) 페이지 기반 페이지네이션
  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(dto)

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    })

    return {
      data,
      total: count,
    }
  }

  // **** 3) 커서 기반 페이지네이션
  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    const findOptions = this.composeFindOptions<T>(dto)

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    })

    // 해당되는 포스트가 0개 이상이면, 마지막 포스트를 가져오고, 아니면 null
    const lastItem = results.length > 0 && results.length === dto.take ? results[results.length - 1] : null
    const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY)
    const host = this.configService.get<string>(ENV_HOST_KEY)
    const nextUrl = lastItem && new URL(`${protocol}://${host}/${path}`)

    /**** dto의 키값들을 루핑하면서
     * 키값에 해당되는 벨류가 존재하면, parame에 그대로 붙여넣는다.
     * 단, where__id__more_than 값만  lastItem의 마지막 값으로 넣어준다.
     */
    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (key !== 'where__id__more_than' && key !== 'where__id__less_than') {
            nextUrl.searchParams.append(key, dto[key])
          }
        }
      }

      let key = null

      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than'
      } else {
        key = 'where__id__less_than'
      }

      nextUrl.searchParams.append(key, lastItem.id.toString())
    }

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    }
  }

  /**** 4) 반환하는 옵션
   * where,
   * order,
   * take,
   * skip -> page 기반일떄만
   *
   * DTO의 현재 싱긴 구조는 아래와 같다.
   * {
   * 	where__id__more_than:1,
   * 	order__createdAt: 'ASC'
   * }
   *
   * 현재는 where__id__more_than 등에 해당하는 where 필터만 사용 중이지만,
   * 나중에 where__likeCount__more_than 등 추가 필터를 넣고 싶어졌을 떄,
   * 모든 where 필터링을 자동으로 파싱할 수 있을만한 기능을 제작해야 한다.
   *
   * 1) where로 시자한다면 필터 로직을 적용한다.
   * 2) order로 시작한다면 정렬 로직을 적용한다.
   * 3) 필터 로직을 적용한다 '__' 기준으로 split 했을떄 3개의 값으로 나뉘는지
   *    2개의 값으로 나뉘는지 확인한다.
   *    3-1) 3개의 값으로 나뉜다면 FILTER_MAPPER에서 해당되는 operator 함수를 찾아서 적용한다.
   *   			 ['where', 'id', 'more_than']
   * 		3-2) 2개의 값으로 나뉜다면 정확한 값을 필터하는 것이기 때문에 operator 없이 적용한다.
   * 			   where__id -> ['where', 'id']
   * 4) order의 경우 3-2와 같이 적용한다.
   */
  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto, //
  ): FindManyOptions<T> {
    let where: FindOptionsWhere<T> = {}
    let order: FindOptionsOrder<T> = {}

    /***
     * key -> where__id__less_than
     * value -> 1
     */
    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        where = { ...where, ...this.parseWhereFilter(key, value) }
      } else if (key.startsWith('order__')) {
        order = { ...order, ...this.parseWhereFilter(key, value) }
      }
    }
    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    }
  }

  /**** 5) 길이가 3일 경우
   * e.g. where__id__more_than을 __를 기준으로 나누면,
   * ['where', 'id', 'more_than']으로 나눌 수 있다.
   */
  private parseWhereFilter<T extends BaseModel>(
    key: string, //
    value: any,
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> = {}
    const split = key.split('__')

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 햇을 떄, 길이가 2 또는 3이어야 합니다 - 문제되는 키값: ${key}`,
      )
    }

    /*** 길이가 2일 경우 where__id = 3을
     * FindOptionsWhere로 풀어보면 아래와 같다
     * {
     * 	where: {
     * 		id : 3,
     * 	}
     * }
     */
    if (split.length === 2) {
      // ['where', 'id']
      const [_, field] = split
      // field -> 'id, value -> 3
      options[field] = value
    } else {
      /*** 길이가 3일 경우 Typeorm 유틸리티 적용이 필요한 경우다
       * where__id__more_than의 경우
       * where는 버려도 되고, 두번쨰 값은 필터할 키값이 되고,
       * 세번쨰 값은 typeorm 유틸리티가 된다.
       *
       * FILTER_MAPPER에 미리 정의해둔 값들로
       * field 값에 FILTER_MAPPER에 해당되는 utility를 가져온 후
       * 값에 적용해준다.
       */
      // ['where', 'id', 'more_than']
      const [_, field, operator] = split

      /*** where__id__between = 3, 4
       * 만약 split 대상 문자가 존재하지 않으면, 길이가 무조건 1이다.
       */
      // const values = value.toString().split(',')

      /***
       * field -> id
       * operator -> more_than
       * FILTER_MAPPER[operator] -> MoreThan
       */
      // if (operator === ' between') {
      //   options[field] = FILTER_MAPPER[operator](values[0], values[1])
      // } else {
      //   options[field] = FILTER_MAPPER[operator](value)
      // }
      if (operator === 'i_like') {
        options[field] = FILTER_MAPPER[operator](`%${value}%`)
      } else {
        options[field] = FILTER_MAPPER[operator](value)
      }
    }

    return options
  }
}
