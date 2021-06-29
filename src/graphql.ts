
/*
 * ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

import { FileUpload } from "graphql-upload";

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

export interface CreateTemplateFileInput {
    templateTypeId: string;
    title?: string;
    isCurrentFileOfItsType?: boolean;
}

export interface UpdateTemplateFileInput {
    title?: string;
    isCurrentFileOfItsType?: boolean;
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

export interface CreateTemplateTypeInput {
    owner: Owner;
    title: string;
}

export interface UpdateTemplateTypeInput {
    title?: string;
    active?: boolean;
    currentFileId?: string;
}

export interface TemplateTypesFilter {
    common?: CommonFilter;
    active?: boolean;
    owners?: Owner[];
}

export interface TemplateTypesRequestOptions {
    page?: PageInput;
}

export interface TemplateFile {
    id: string;
    title?: string;
    mimeType: string;
    templateType: TemplateType;
    isCurrentFileOfItsType?: boolean;
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
    printTemplateType(id: string, userId: number, fillData?: JSON): PrintOutput | Promise<PrintOutput>;
}

export interface IMutation {
    createTemplateFile(file: Upload, data: CreateTemplateFileInput): TemplateFile | Promise<TemplateFile>;
    updateTemplateFile(id: string, data: UpdateTemplateFileInput): TemplateFile | Promise<TemplateFile>;
    removeTemplateFile(id: string): TemplateFile | Promise<TemplateFile>;
    createTemplateType(data: CreateTemplateTypeInput): TemplateType | Promise<TemplateType>;
    updateTemplateType(id: string, data: UpdateTemplateTypeInput): TemplateType | Promise<TemplateType>;
    removeTemplateType(id: string): TemplateType | Promise<TemplateType>;
}

export interface TemplateType {
    id: string;
    owner: Owner;
    title: string;
    active: boolean;
    pageOfFiles?: TemplateFilesPageResult;
    currentFile?: TemplateFile;
}

export interface TemplateTypesPageResult {
    items: TemplateType[];
    total: number;
}

export interface PrintOutput {
    token: string;
}

export type Upload = FileUpload;
export type JSON = unknown;
