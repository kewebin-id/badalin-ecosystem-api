import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => String)
  search?: string;
}

interface PaginationInterface<T> {
  count: number;
  rows: T[];
}

export class Pagination {
  page: number;
  limit: number;
  offset: number;

  constructor(page: number | string = 1, size: number | string = 10) {
    this.page = parseInt(page as string) || 1;
    this.limit = parseInt(size as string) || 10;
    this.offset = (this.page - 1) * this.limit;
  }

  paginate<T>(data: PaginationInterface<T>) {
    const totalPages = Math.ceil(data.count / this.limit);
    return {
      totalItems: data.count,
      totalPages: totalPages,
      currentPage: this.page,
      items: data.rows,
      links: {
        prev: this.page > 1 ? `?page=${this.page - 1}&limit=${this.limit}` : null,
        next: this.page < totalPages ? `?page=${this.page + 1}&limit=${this.limit}` : null,
      },
    };
  }
}
