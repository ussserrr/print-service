
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class TemplateFile {
    id: string;
    name: string;
    mimeType: string;
    templateType: TemplateType;
    currentFileOfType?: TemplateType;
    createdAt: Date;
    updatedAt?: Date;
}

export abstract class IQuery {
    abstract templateFiles(): TemplateFile[] | Promise<TemplateFile[]>;

    abstract templateFile(id: string): TemplateFile | Promise<TemplateFile>;

    abstract templateTypes(): TemplateType[] | Promise<TemplateType[]>;

    abstract templateType(id: string): TemplateType | Promise<TemplateType>;
}

export class TemplateType {
    id: string;
    title: string;
    active: boolean;
    files?: TemplateFile[];
    currentFile?: TemplateFile;
}
