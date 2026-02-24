import { Role } from '@/lib/types';

const CDRAGON = 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg';

const ROLE_ICON_NAME: Record<Role, string> = {
	top: 'position-top',
	jungle: 'position-jungle',
	mid: 'position-middle',
	bottom: 'position-bottom',
	support: 'position-utility',
};

interface RoleIconProps {
	role: Role;
	size?: number;
	className?: string;
}

export default function RoleIcon({ role, size = 16, className }: RoleIconProps) {
	const name = ROLE_ICON_NAME[role];
	return (
		<img
			src={`${CDRAGON}/${name}.svg`}
			alt={role}
			width={size}
			height={size}
			className={`role-icon${className ? ` ${className}` : ''}`}
			style={{ display: 'inline-block', verticalAlign: 'middle' }}
		/>
	);
}
