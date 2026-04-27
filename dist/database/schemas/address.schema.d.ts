import { HydratedDocument, Types } from 'mongoose';
export type AddressDocument = HydratedDocument<Address>;
export declare class Address {
    userId: Types.ObjectId;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}
export declare const AddressSchema: import("mongoose").Schema<Address, import("mongoose").Model<Address, any, any, any, any, any, Address>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Address, import("mongoose").Document<unknown, {}, Address, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Address & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Address, import("mongoose").Document<unknown, {}, Address, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Address & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    street?: import("mongoose").SchemaDefinitionProperty<string, Address, import("mongoose").Document<unknown, {}, Address, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Address & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    city?: import("mongoose").SchemaDefinitionProperty<string, Address, import("mongoose").Document<unknown, {}, Address, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Address & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    state?: import("mongoose").SchemaDefinitionProperty<string, Address, import("mongoose").Document<unknown, {}, Address, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Address & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    zipCode?: import("mongoose").SchemaDefinitionProperty<string, Address, import("mongoose").Document<unknown, {}, Address, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Address & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    country?: import("mongoose").SchemaDefinitionProperty<string, Address, import("mongoose").Document<unknown, {}, Address, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Address & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isDefault?: import("mongoose").SchemaDefinitionProperty<boolean, Address, import("mongoose").Document<unknown, {}, Address, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Address & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Address>;
