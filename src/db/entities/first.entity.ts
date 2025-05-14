import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("first_entity")
export class FirstEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;
}
