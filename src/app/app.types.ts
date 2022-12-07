export interface UserDocument {
  /**
   * Firebase
   */
  userId: string;
  avatar: string;
  biography: string;
  country: string;
  state: string;
  province: string;
  lastSeen: number;

  /**
   * Normal account
   */
  firstName: string;
  gender: string;
  lastName: string;
  /**
   * Company account
   */
  companyAccount: string;
  companyName: string;

  /**
   * Local
   */
  canSendMessage?: boolean;
  email?: string;
  canEditProfile?: boolean;
  accountCreated?: boolean;
  emailVerified?: boolean;
}

export interface Post {
  /**
   * Firebase
   */
  creatorId: string;
  postId: string;
  timestamp: number;
  type: number;
  post: post;
  project: project | null;

  /**
   * Local
   */
  date?: string;
  creator?: {
    name: string;
    avatar: string;
  };
}

export interface post {
  comment: string | null;
  imageUrl: string | null;
}

export interface project {
  description: string | null;
  email: string;
  endDate: string | null;
  imageUrl: string | null;
  tel: string;
}

export interface Chat {
  chatId: string;
  members: string[];
  name?: string;
  icon?: string;
}

export interface ChatMessage {
  messageId?: string;
  authorId: string;
  content: string;
  attachments: MessageAttachment[];
  timestamp: number;
  date?: string;
  author?: {
    name: string;
    avatar: string;
  };
}

export interface MessageAttachment {
  type: string;
  url: string;
  name: string;
  timestamp: number;
  lastModified: number;
  size: number;
}

export interface ChatData {
  name: string;
  userId: string;
}

export interface States {
  name: string;
  state_code: string;
}

export interface CountriesAndStates {
  iso2: string;
  iso3: string;
  name: string;
  states: States[];
}
