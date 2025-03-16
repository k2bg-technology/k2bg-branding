import {
  INSTAGRAM_GRAPH_API_BASE_URL,
  INSTAGRAM_LONG_ACCESS_TOKEN,
} from './const';

export class Core {
  private params: URLSearchParams;

  constructor() {
    this.params = new URLSearchParams();
    this.params.append('access_token', INSTAGRAM_LONG_ACCESS_TOKEN);
  }

  protected fetch(
    resource: string,
    optionalParams?: Record<string, string>,
    init?: RequestInit
  ) {
    if (optionalParams) {
      Object.entries(optionalParams).forEach(([key, value]) => {
        this.params.append(key, value);
      });
    }

    const url = new URL(
      `${INSTAGRAM_GRAPH_API_BASE_URL}/${resource}?${this.params}`
    );

    return fetch(url, init);
  }
}
