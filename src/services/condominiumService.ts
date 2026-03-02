import { fetchAPI } from './api';

export type CondominiumCreateData =
{
  message: string;
  condominium:
  {
    id: number;
    name: string;
    token: string;
    owner_id: number;
  };
};

export type CondominiumLinkData =
{
  message: string;
  user: { id: number };
  condominium: CondominiumCreateData['condominium'];
};

export async function createCondominium(name: string): Promise<CondominiumCreateData>
{
  const data: CondominiumCreateData = await fetchAPI('/condominium/create', 'POST', { name });
  return data;
}

export async function linkCondominium(userToken: string, condominiumToken: string): Promise<CondominiumLinkData>
{
  const data: CondominiumLinkData = await fetchAPI('/condominios/link', 'POST',
  {
    user_token: userToken,
    condominium_token: condominiumToken.trim().toUpperCase()
  });
  return data;
}
