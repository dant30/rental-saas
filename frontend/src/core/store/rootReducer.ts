export type RootState = Readonly<Record<string, unknown>>;

export const rootReducer = (state: RootState = {}) => state;
