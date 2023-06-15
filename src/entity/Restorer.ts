import {Entity, PrimaryColumn, Column, OneToOne, JoinColumn} from "typeorm";
import {Address} from "./Address";


@Entity()
export class Restorer {

  @PrimaryColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  kitty: Number;

  @OneToOne(type => Address)
  @JoinColumn()
  address: Address;
}