/* tslint:disable */
/*
 * Autogenerated by @creditkarma/thrift-typescript v{{VERSION}}
 * DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
*/
import * as thrift from "test-lib";
import * as __NAMESPACE__ from "./.";
export interface IWorkArgs {
    num1: number;
    num2: number;
    op?: __NAMESPACE__.Operation;
    comment?: string;
}
export class Work {
    public num1: number = 0;
    public num2: number;
    public op?: __NAMESPACE__.Operation = __NAMESPACE__.Operation.ADD;
    public comment?: string;
    constructor(args: IWorkArgs) {
        if (args != null && args.num1 != null) {
            this.num1 = args.num1;
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field[num1] is unset!");
        }
        if (args != null && args.num2 != null) {
            this.num2 = args.num2;
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field[num2] is unset!");
        }
        if (args != null && args.op != null) {
            this.op = args.op;
        }
        if (args != null && args.comment != null) {
            this.comment = args.comment;
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("Work");
        if (this.num1 != null) {
            output.writeFieldBegin("num1", thrift.Thrift.Type.I32, 1);
            output.writeI32(this.num1);
            output.writeFieldEnd();
        }
        if (this.num2 != null) {
            output.writeFieldBegin("num2", thrift.Thrift.Type.I32, 2);
            output.writeI32(this.num2);
            output.writeFieldEnd();
        }
        if (this.op != null) {
            output.writeFieldBegin("op", thrift.Thrift.Type.I32, 3);
            output.writeI32(this.op);
            output.writeFieldEnd();
        }
        if (this.comment != null) {
            output.writeFieldBegin("comment", thrift.Thrift.Type.STRING, 4);
            output.writeString(this.comment);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): Work {
        input.readStructBegin();
        let _args: any = {};
        while (true) {
            const ret: thrift.TField = input.readFieldBegin();
            const fieldType: thrift.Thrift.Type = ret.ftype;
            const fieldId: number = ret.fid;
            if (fieldType === thrift.Thrift.Type.STOP) {
                break;
            }
            switch (fieldId) {
                case 1:
                    if (fieldType === thrift.Thrift.Type.I32) {
                        const value_1: number = input.readI32();
                        _args.num1 = value_1;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.Thrift.Type.I32) {
                        const value_2: number = input.readI32();
                        _args.num2 = value_2;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 3:
                    if (fieldType === thrift.Thrift.Type.I32) {
                        const value_3: __NAMESPACE__.Operation = input.readI32();
                        _args.op = value_3;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 4:
                    if (fieldType === thrift.Thrift.Type.STRING) {
                        const value_4: string = input.readString();
                        _args.comment = value_4;
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
        if (_args.num1 !== undefined && _args.num2 !== undefined) {
            return new Work(_args);
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Unable to read Work from input");
        }
    }
}
