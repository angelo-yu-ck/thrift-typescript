/* tslint:disable */
/*
 * Autogenerated by @creditkarma/thrift-typescript v3.1.1
 * DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
*/
import Int64 = require("node-int64");
import * as thrift from "test-lib";
import * as shared from "./../shared";
import * as common from "./../common";
import * as operation from "./../operation";
import * as __NAMESPACE__ from "./.";
export interface IChoiceArgs {
    firstName?: __NAMESPACE__.FirstName;
    lastName?: __NAMESPACE__.LastName;
}
export class Choice {
    public firstName?: __NAMESPACE__.FirstName;
    public lastName?: __NAMESPACE__.LastName;
    constructor(args?: IChoiceArgs) {
        let _fieldsSet: number = 0;
        if (args != null) {
            if (args.firstName != null) {
                _fieldsSet++;
                this.firstName = args.firstName;
            }
            if (args.lastName != null) {
                _fieldsSet++;
                this.lastName = args.lastName;
            }
            if (_fieldsSet > 1) {
                throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
            }
            else if (_fieldsSet < 1) {
                throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
            }
        }
    }
    public static fromFirstName(firstName: __NAMESPACE__.FirstName): Choice {
        return new Choice({ firstName });
    }
    public static fromLastName(lastName: __NAMESPACE__.LastName): Choice {
        return new Choice({ lastName });
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("Choice");
        if (this.firstName != null) {
            output.writeFieldBegin("firstName", thrift.Thrift.Type.STRUCT, 1);
            this.firstName.write(output);
            output.writeFieldEnd();
        }
        if (this.lastName != null) {
            output.writeFieldBegin("lastName", thrift.Thrift.Type.STRUCT, 2);
            this.lastName.write(output);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): Choice {
        let _fieldsSet: number = 0;
        let _returnValue: Choice | null = null;
        input.readStructBegin();
        while (true) {
            const ret: thrift.TField = input.readFieldBegin();
            const fieldType: thrift.Thrift.Type = ret.ftype;
            const fieldId: number = ret.fid;
            if (fieldType === thrift.Thrift.Type.STOP) {
                break;
            }
            switch (fieldId) {
                case 1:
                    if (fieldType === thrift.Thrift.Type.STRUCT) {
                        _fieldsSet++;
                        const value_1: __NAMESPACE__.FirstName = __NAMESPACE__.FirstName.read(input);
                        _returnValue = Choice.fromFirstName(value_1);
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.Thrift.Type.STRUCT) {
                        _fieldsSet++;
                        const value_2: __NAMESPACE__.LastName = __NAMESPACE__.LastName.read(input);
                        _returnValue = Choice.fromLastName(value_2);
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
        if (_fieldsSet > 1) {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
        }
        if (_returnValue !== null) {
            return _returnValue;
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    }
}
