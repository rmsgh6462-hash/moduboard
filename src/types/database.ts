export type UserRole = "teacher" | "student";
export type Gender = "M" | "F" | "other";

export type Group = {
  id: string;
  teacher_id: string;
  school_name: string;
  grade: number;
  class_num: number;
  created_at: string;
};

export type UserProfile = {
  id: string;
  role: UserRole;
  group_id: string | null;
  student_num: number | null;
  name: string;
  gender: Gender | null;
  login_id: string | null;
  created_at: string;
};

export type Board = {
  id: string;
  title: string;
  group_id: string;
  created_by: string;
  created_at: string;
};

export type Post = {
  id: string;
  board_id: string;
  user_id: string;
  author_name: string;
  content: string;
  image_url: string | null;
  color: string;
  x_pos: number;
  y_pos: number;
  created_at: string;
};

type Tables = {
  groups: {
    Row: Group;
    Insert: {
      id?: string;
      teacher_id: string;
      school_name: string;
      grade: number;
      class_num: number;
      created_at?: string;
    };
    Update: {
      id?: string;
      teacher_id?: string;
      school_name?: string;
      grade?: number;
      class_num?: number;
      created_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "groups_teacher_id_fkey";
        columns: ["teacher_id"];
        isOneToOne: false;
        referencedRelation: "users";
        referencedColumns: ["id"];
      },
    ];
  };
  users: {
    Row: UserProfile;
    Insert: {
      id: string;
      role: UserRole;
      group_id?: string | null;
      student_num?: number | null;
      name: string;
      gender?: Gender | null;
      login_id?: string | null;
      created_at?: string;
    };
    Update: {
      id?: string;
      role?: UserRole;
      group_id?: string | null;
      student_num?: number | null;
      name?: string;
      gender?: Gender | null;
      login_id?: string | null;
      created_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "users_group_id_fkey";
        columns: ["group_id"];
        isOneToOne: false;
        referencedRelation: "groups";
        referencedColumns: ["id"];
      },
    ];
  };
  boards: {
    Row: Board;
    Insert: {
      id?: string;
      title: string;
      group_id: string;
      created_by: string;
      created_at?: string;
    };
    Update: {
      id?: string;
      title?: string;
      group_id?: string;
      created_by?: string;
      created_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "boards_group_id_fkey";
        columns: ["group_id"];
        isOneToOne: false;
        referencedRelation: "groups";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "boards_created_by_fkey";
        columns: ["created_by"];
        isOneToOne: false;
        referencedRelation: "users";
        referencedColumns: ["id"];
      },
    ];
  };
  posts: {
    Row: Post;
    Insert: {
      id?: string;
      board_id: string;
      user_id: string;
      author_name: string;
      content?: string;
      image_url?: string | null;
      color?: string;
      x_pos?: number;
      y_pos?: number;
      created_at?: string;
    };
    Update: {
      id?: string;
      board_id?: string;
      user_id?: string;
      author_name?: string;
      content?: string;
      image_url?: string | null;
      color?: string;
      x_pos?: number;
      y_pos?: number;
      created_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "posts_board_id_fkey";
        columns: ["board_id"];
        isOneToOne: false;
        referencedRelation: "boards";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "posts_user_id_fkey";
        columns: ["user_id"];
        isOneToOne: false;
        referencedRelation: "users";
        referencedColumns: ["id"];
      },
    ];
  };
};

export type Database = {
  public: {
    Tables: Tables;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
