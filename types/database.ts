// types/database.ts
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          user_type: 'influencer' | 'advertiser';
          created_at: string;
          updated_at: string;
        };
        Insert: any;
        Update: any;
      };
      influencers: {
        Row: any;
        Insert: any;
        Update: any;
      };
      advertisers: {
        Row: any;
        Insert: any;
        Update: any;
      };
      campaigns: {
        Row: any;
        Insert: any;
        Update: any;
      };
      notifications: {
        Row: any;
        Insert: any;
        Update: any;
      };
    };
  };
}