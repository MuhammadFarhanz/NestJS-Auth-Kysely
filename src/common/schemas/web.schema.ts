import { ApiProperty } from '@nestjs/swagger';

export class Paging {
  @ApiProperty({ example: 0 })
  size!: number;

  @ApiProperty({ example: 0 })
  total_page!: number;

  @ApiProperty({ example: 0 })
  current_page!: number;
}

export class WebResponse<T> {
  @ApiProperty({
    description: 'Response data payload',
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'Error message if any',
    required: false,
    example: 'Error message',
  })
  errors?: string;

  @ApiProperty({
    description: 'Pagination information',
    required: false,
    type: Paging,
  })
  paging?: Paging;

  // Helper method for Swagger
  static forSwagger<T>(type: new () => T): typeof WebResponse {
    class SwaggerWebResponse extends WebResponse<T> {
      @ApiProperty({ type })
      data?: T;
    }
    return SwaggerWebResponse as any;
  }
}
