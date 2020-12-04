
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum Operator {
    LT = "LT",
    LE = "LE",
    GT = "GT",
    GE = "GE"
}

export enum SortOrder {
    ASC = "ASC",
    DESC = "DESC"
}

export enum Owner {
    DRIVER = "DRIVER",
    CAR = "CAR"
}

export class CommonFilter {
    ids?: string[];
    search?: string;
}

export class DateFilter {
    operator?: Operator;
    value: Date;
}

export class SortBy {
    field: string;
    order: SortOrder;
}

export class PageInput {
    limit?: number;
    offset?: number;
    sortBy?: SortBy;
}

export class TemplateFilesFilter {
    common?: CommonFilter;
    templateTypes?: string[];
    createdAt?: DateFilter[];
    updatedAt?: DateFilter[];
}

export class TemplateFilesRequestOptions {
    page?: PageInput;
}

export class TemplateTypesFilter {
    common?: CommonFilter;
    active?: boolean;
    owners?: Owner[];
}

export class TemplateTypesRequestOptions {
    page?: PageInput;
    listPageOfFiles?: boolean;
}

export class TemplateFile {
    id: string;
    title: string;
    mimeType: string;
    templateType: TemplateType;
    isCurrentFileOfItsType: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

export class TemplateFilesPageResult {
    items: TemplateFile[];
    total: number;
}

export abstract class IQuery {
    abstract templateFiles(filter?: TemplateFilesFilter, options?: TemplateFilesRequestOptions): TemplateFilesPageResult | Promise<TemplateFilesPageResult>;

    abstract templateFile(id: string): TemplateFile | Promise<TemplateFile>;

    abstract templateTypes(filter?: TemplateTypesFilter, options?: TemplateTypesRequestOptions): TemplateTypesPageResult | Promise<TemplateTypesPageResult>;

    abstract templateType(id: string): TemplateType | Promise<TemplateType>;
}

export class TemplateType {
    id: string;
    owner: Owner;
    title: string;
    active: boolean;
    files: TemplateFile[];
    currentFile?: TemplateFile;
}

export class TemplateTypesPageResult {
    items: TemplateType[];
    total: number;
}
