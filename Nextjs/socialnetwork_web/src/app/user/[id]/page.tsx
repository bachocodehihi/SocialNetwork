'use client';

import { useParams } from 'next/navigation';
import ProfileView from '../../../components/Profile/ProfileView';

export default function UserProfileDynamicPage() {
  const params = useParams();
  const id = params.id as string;

  return <ProfileView targetId={id} />;
}
