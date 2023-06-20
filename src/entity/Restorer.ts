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

  @Column({ nullable: false, type: "float", default: 0.0 })
  kitty: Number;


  @OneToOne(type => Address)
  @JoinColumn()
  address: Address;
}