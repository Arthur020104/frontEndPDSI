import { fetchAPI, getImageUrl } from './api';

const FALLBACK_AVATAR = 'https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg';
const FALLBACK_BANNER = 'https://as2.ftcdn.net/jpg/00/98/51/39/1000_F_98513963_kUhivDRmAE3zdAwjYZM80jdauUmqR7A2.jpg';

export type RawProfile =
{
  id: number;
  avatar_id: number | null;
  banner_id: number | null;
  userId: number;
};

export type LastAction =
{
  id: string;
  title: string;
  location: string;
  displayDate: string;
  img?: string;
};

export type ProfileData =
{
  phone: string;
  email: string;
  profileImg: string;
  bannerImg: string;
  lastActions: LastAction[];
};

export type ProfileResult =
{
  username: string;
  userId: number;
  data: ProfileData;
};

export async function fetchProfileById(userId: number): Promise<RawProfile>
{
  const data = await fetchAPI(`/profile/${userId}`);
  return data as RawProfile;
}

export function resolveProfileImages(
  avatarId: number | null,
  bannerId: number | null
): { avatarUrl: string; bannerUrl: string }
{
  return {
    avatarUrl: avatarId !== null ? getImageUrl(avatarId) : FALLBACK_AVATAR,
    bannerUrl: bannerId !== null ? getImageUrl(bannerId) : FALLBACK_BANNER
  };
}

export async function updateProfileImages(
  userId: number,
  avatarUri?: string,
  bannerUri?: string
): Promise<RawProfile>
{
  const form = new FormData();
  if (avatarUri)
  {
    const filename = avatarUri.split('/').pop() ?? 'avatar.jpg';
    form.append('avatar', { uri: avatarUri, name: filename, type: 'image/jpeg' } as any);
  }
  if (bannerUri)
  {
    const filename = bannerUri.split('/').pop() ?? 'banner.jpg';
    form.append('banner', { uri: bannerUri, name: filename, type: 'image/jpeg' } as any);
  }
  const data = await fetchAPI(`/profile/${userId}`, 'PUT', form);
  return data as RawProfile;
}

export async function fetchProfile(): Promise<ProfileResult>
{
  const me = await fetchAPI('/auth/me');
  const raw = await fetchProfileById(me.id);
  const { avatarUrl, bannerUrl } = resolveProfileImages(raw.avatar_id, raw.banner_id);
  return {
    username: me.username || '',
    userId: me.id,
    data: {
      phone: me.phone || '',
      email: me.email || '',
      profileImg: avatarUrl,
      bannerImg: bannerUrl,
      lastActions: me.lastActions || []
    }
  };
}
