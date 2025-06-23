// Simplified Firebase Admin for development without service account
// Use client SDK patterns for now to avoid authentication complexity
export const adminDb = {
  collection: (path: string) => ({
    doc: (id: string) => ({
      get: async () => ({
        data: () => null,
        exists: false
      })
    }),
    where: (field: string, op: string, value: any) => ({
      orderBy: (field: string, direction?: string) => ({
        limit: (count: number) => ({
          get: async () => ({ docs: [] })
        }),
        get: async () => ({ docs: [] })
      }),
      limit: (count: number) => ({
        get: async () => ({ docs: [] })
      }),
      get: async () => ({ docs: [] })
    }),
    orderBy: (field: string, direction?: string) => ({
      limit: (count: number) => ({
        get: async () => ({ docs: [] })
      }),
      get: async () => ({ docs: [] })
    }),
    limit: (count: number) => ({
      get: async () => ({ docs: [] })
    }),
    get: async () => ({ docs: [] })
  })
};

// For backward compatibility with existing code
export const db = {
  collection: (path: string) => ({
    where: (field: string, op: string, value: any) => ({
      get: async () => ({
        docs: []
      })
    }),
    get: async () => ({
      docs: []
    })
  })
};