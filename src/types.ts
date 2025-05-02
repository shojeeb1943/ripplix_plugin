export interface Animation {
  id: number;
  title: string;
  url: string;
  video_url: string;
  app: string;
  platform: string;
  industry: string;
  interaction: string;
  logo: string;
}

export interface AppState {
  animations: Animation[];
  filteredAnimations: Animation[];
  searchQuery: string;
  filters: {
    platform: string[];
    interaction: string[];
  };
  selectedAnimation: Animation | null;
  isLoading: boolean;
  error: string | null;
}

export interface FilterOptions {
  platform: string[];
  interaction: string[];
} 