// Mock Firebase Admin for development
// In production, this would use actual Firebase Admin SDK
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