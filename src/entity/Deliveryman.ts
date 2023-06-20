import {Entity, PrimaryColumn, Column, OneToOne, JoinColumn} from "typeorm";
import {Address} from "./Address";


@Entity()
export class Deliveryman {

    @PrimaryColumn("uuid")
    id: string;

    @Column()
    firstName: string;

    @Column()
    name: string;

    @Column()
    birthday: string;

    @Column()
    phoneNumber: string;

    @Column({ nullable: false, type: "float", default: 0.0 })
    kitty: Number;

    @Column({ nullable: false, type: "boolean", default: 0.0 })
    available: boolean;

    @OneToOne(type => Address)
    @JoinColumn()
    address: Address;
}