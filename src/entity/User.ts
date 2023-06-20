import {Entity, PrimaryColumn, Column, OneToOne, JoinColumn} from "typeorm";
import {Address} from "./Address";


@Entity()
export class User {

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

    @OneToOne(type => Address)
    @JoinColumn()
    address: Address;
}