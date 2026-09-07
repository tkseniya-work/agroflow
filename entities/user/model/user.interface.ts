export interface UserInfo
{
  sub: string | null,
  family_name: string | null,
  given_name: string | null,
  name: string | null,
  picture: string | null,
  uuid_company_id: string | null,
}

export interface UserState {
  userInfo: UserInfo | null;
  error: string | null;
}
