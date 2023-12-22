import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../database/baseEntities/base';

@Entity('user')
export class UserEntity extends BaseEntity {
	@Column({ type: 'varchar', length: 50 })
	user_name: string;

	@Column({ type: 'varchar', length: 255 })
	pass_word: string;

	@Column({ type: 'varchar', length: 255 })
	salt: string;

	@Column({ type: 'boolean', comment: '是否为管理员', default: false })
	is_admin: boolean = false;

	@Column({ type: 'varchar', length: 20 })
	phone: string;

	@Column({ type: 'varchar', length: 50 })
	email: string;
}
