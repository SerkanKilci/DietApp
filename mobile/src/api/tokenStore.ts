// Erişim token'ının React state'inden bağımsız, senkron okunabilen bir kopyası.
// axios interceptor'ı her istekte bunu okur; zustand hook'unu modül seviyesinde kullanmak yerine
// bu düz değişken, gereksiz bağımlılık döngülerinden kaçınmamızı sağlar.
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
