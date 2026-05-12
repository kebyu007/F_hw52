import { UserRoles } from '@/core/constants/constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({ collection: 'users', timestamps: true, versionKey: false })
export class User {
  @Prop({ type: SchemaTypes.String })
  name: string;

  @Prop({ type: SchemaTypes.Number, allowNull: true })
  age?: number;

  @Prop({ type: SchemaTypes.String })
  email: string;

  @Prop({ type: SchemaTypes.String })
  password: string;

  @Prop({ type: SchemaTypes.Number, allowNull: true })
  profile?: string;

  @Prop({ type: SchemaTypes.String, enum: UserRoles, default: UserRoles.user })
  role: UserRoles;
}

export const UserSchema = SchemaFactory.createForClass(User);
