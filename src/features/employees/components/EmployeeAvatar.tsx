import { Avatar } from 'antd';
import { useEmployeePhoto } from '../api/employeesApi';
import { initials } from '../utils/initials';

interface EmployeeAvatarProps {
  id: number;
  name: string;
  hasPhoto: boolean;
  size?: number;
}

const COLORS = ['#1677ff', '#13a8a8', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#2f54eb', '#faad14'];

/**
 * Employee photo loaded through the authenticated API (photos are never public URLs),
 * falling back to coloured initials.
 */
export function EmployeeAvatar({ id, name, hasPhoto, size = 36 }: EmployeeAvatarProps) {
  const photo = useEmployeePhoto(id, hasPhoto);
  // Only show the image while the employee has one (the cache may still hold a removed photo).
  const url = hasPhoto ? photo.data : undefined;

  return (
    <Avatar
      size={size}
      src={url}
      style={
        url
          ? undefined
          : { backgroundColor: COLORS[id % COLORS.length], fontSize: size * 0.38, flexShrink: 0 }
      }
      alt={name}
    >
      {initials(name)}
    </Avatar>
  );
}
