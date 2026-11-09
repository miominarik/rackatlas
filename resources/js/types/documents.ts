export type DocumentStatus = 'draft' | 'current' | 'outdated';

export type DocumentField = {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'date';
    placeholder: string;
};

export type DocumentSection = { title: string; body: string };

export type DocumentTemplate = {
    key: string;
    icon: string;
    label: string;
    description: string;
    fields: DocumentField[];
    sections: DocumentSection[];
};

export type DocumentSummary = {
    id: number;
    title: string;
    subject: string | null;
    template: string;
    status: DocumentStatus;
    server_id: number | null;
    server_name: string | null;
    reviewed_at: string | null;
    updated_at: string | null;
    updated_by: string | null;
};

export type DocumentFull = DocumentSummary & {
    fields: Record<string, string>;
    sections: DocumentSection[];
    created_at: string | null;
    created_by: string | null;
};
