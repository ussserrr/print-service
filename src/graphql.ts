
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

export interface CommonFilter {
    ids?: string[];
    search?: string;
}

export interface DateFilter {
    operator: Operator;
    value: Date;
}

export interface SortBy {
    field: string;
    order: SortOrder;
}

export interface PageInput {
    limit?: number;
    offset?: number;
    sortBy?: SortBy;
}

export interface TemplateFilesFilter {
    common?: CommonFilter;
    templateTypes?: string[];
    createdAt?: DateFilter[];
    updatedAt?: DateFilter[];
}

export interface TemplateFilesRequestOptions {
    page?: PageInput;
}

export interface TemplateTypesFilter {
    common?: CommonFilter;
    active?: boolean;
    owners?: Owner[];
}

export interface TemplateTypesRequestOptions {
    page?: PageInput;
    listFiles?: boolean;
}

export interface TemplateFile {
    id: string;
    title: string;
    mimeType: string;
    templateType: TemplateType;
    isCurrentFileOfItsType: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface TemplateFilesPageResult {
    items: TemplateFile[];
    total: number;
}

export interface IQuery {
    templateFiles(filter?: TemplateFilesFilter, options?: TemplateFilesRequestOptions): TemplateFilesPageResult | Promise<TemplateFilesPageResult>;
    templateFile(id: string): TemplateFile | Promise<TemplateFile>;
    templateTypes(filter?: TemplateTypesFilter, options?: TemplateTypesRequestOptions): TemplateTypesPageResult | Promise<TemplateTypesPageResult>;
    templateType(id: string): TemplateType | Promise<TemplateType>;
}

export interface TemplateType {
    id: string;
    owner: Owner;
    title: string;
    active: boolean;
    files?: TemplateFilesPageResult;
    currentFile?: TemplateFile;
}

export interface TemplateTypesPageResult {
    items: TemplateType[];
    total: number;
}
