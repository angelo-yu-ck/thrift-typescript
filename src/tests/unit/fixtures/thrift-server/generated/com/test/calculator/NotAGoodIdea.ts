/* tslint:disable */
/*
 * Autogenerated by @creditkarma/thrift-typescript v3.4.2
 * DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
*/
import * as thrift from "test-lib";
export interface INotAGoodIdea {
    __name: "NotAGoodIdea";
    message?: string;
}
export interface INotAGoodIdeaArgs {
    message?: string;
}
export const NotAGoodIdeaCodec: thrift.IStructCodec<INotAGoodIdeaArgs, INotAGoodIdea> = {
    encode(args: INotAGoodIdeaArgs, output: thrift.TProtocol): void {
        const obj = {
            message: args.message
        };
        output.writeStructBegin("NotAGoodIdea");
        if (obj.message != null) {
            output.writeFieldBegin("message", thrift.TType.STRING, 1);
            output.writeString(obj.message);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): INotAGoodIdea {
        let _args: any = {};
        input.readStructBegin();
        while (true) {
            const ret: thrift.IThriftField = input.readFieldBegin();
            const fieldType: thrift.TType = ret.fieldType;
            const fieldId: number = ret.fieldId;
            if (fieldType === thrift.TType.STOP) {
                break;
            }
            switch (fieldId) {
                case 1:
                    if (fieldType === thrift.TType.STRING) {
                        const value_1: string = input.readString();
                        _args.message = value_1;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                default: {
                    input.skip(fieldType);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        return {
            __name: "NotAGoodIdea",
            message: _args.message
        };
    }
};
export class NotAGoodIdea extends thrift.StructLike implements INotAGoodIdea {
    public message?: string;
    public readonly __name = "NotAGoodIdea";
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: INotAGoodIdeaArgs = {}) {
        super();
        if (args.message != null) {
            const value_2: string = args.message;
            this.message = value_2;
        }
    }
    public static read(input: thrift.TProtocol): NotAGoodIdea {
        return new NotAGoodIdea(NotAGoodIdeaCodec.decode(input));
    }
    public static write(args: INotAGoodIdeaArgs, output: thrift.TProtocol): void {
        return NotAGoodIdeaCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return NotAGoodIdeaCodec.encode(this, output);
    }
}
