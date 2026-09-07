import { atom, type PrimitiveAtom } from "jotai";

export const nullableAtom = <Value>(): PrimitiveAtom<Value | null> =>
  atom<Value | null>(null as Value | null);

type CollectionRepository<Item, InsertResult, AddInput, DeleteInput> = {
  findAll: () => Promise<Item[]> | Item[];
  insertMany: (items: AddInput[]) => Promise<InsertResult> | InsertResult;
  deleteMany: (items: DeleteInput[]) => Promise<unknown> | unknown;
  clear: () => Promise<unknown> | unknown;
};

type CreateLocalCollectionAtomsOptions<
  Item,
  InsertResult,
  AddResult,
  AddInput,
  DeleteInput,
> = {
  name: string;
  repository: CollectionRepository<Item, InsertResult, AddInput, DeleteInput>;
  addResult?: (result: InsertResult, items: AddInput[]) => AddResult;
  onEmptyAdd?: () => Promise<AddResult> | AddResult;
};

type RecordRepository<Item, CreateResult, CreateInput> = {
  findFirst: () => Promise<Item | null> | Item | null;
  create: (item: CreateInput) => Promise<CreateResult> | CreateResult;
  clear: () => Promise<unknown> | unknown;
};

type CreateLocalRecordAtomsOptions<
  Item,
  CreateResult,
  AddResult,
  CreateInput,
> = {
  name: string;
  repository: RecordRepository<Item, CreateResult, CreateInput>;
  addResult?: (result: CreateResult, item: CreateInput) => AddResult;
};

type QueueActions<Item, AddInput, AddResult> = {
  load: () => Promise<Item[]> | Item[];
  add: (
    input: AddInput,
  ) =>
    | Promise<{ result: AddResult; items: Item[] }>
    | { result: AddResult; items: Item[] };
  clear: () => Promise<Item[]> | Item[];
};

type CreateLocalQueueAtomsOptions<Item, AddInput, AddResult> = {
  name: string;
  actions: QueueActions<Item, AddInput, AddResult>;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const createLocalCollectionAtoms = <
  Item,
  InsertResult = unknown,
  AddResult = InsertResult,
  AddInput = Item,
  DeleteInput = Item,
>({
  name,
  repository,
  addResult,
  onEmptyAdd,
}: CreateLocalCollectionAtomsOptions<
  Item,
  InsertResult,
  AddResult,
  AddInput,
  DeleteInput
>) => {
  const dataAtom = atom<Item[]>([]);
  const loadingAtom = atom<boolean>(false);
  const errorAtom = nullableAtom<string>();

  const loadAtom = atom(
    (get) => ({
      data: get(dataAtom),
      loading: get(loadingAtom),
      error: get(errorAtom),
    }),
    async (get, set) => {
      if (get(loadingAtom)) return;

      set(loadingAtom, true);
      set(errorAtom, null);

      try {
        const items = await repository.findAll();
        set(dataAtom, items ?? []);
      } catch (error) {
        const errorMessage = getErrorMessage(error, `Failed to load ${name}`);
        set(errorAtom, errorMessage);
        console.error(`Error loading ${name}:`, error);
      } finally {
        set(loadingAtom, false);
      }
    },
  );

  const addAtom = atom(null, async (get, set, items: AddInput[]) => {
    if (get(loadingAtom)) return;

    set(loadingAtom, true);
    set(errorAtom, null);

    try {
      if (!items?.length) {
        if (onEmptyAdd) {
          set(dataAtom, []);
          return await onEmptyAdd();
        }

        throw new Error(`No ${name} data provided`);
      }

      const result = await repository.insertMany(items);
      const allItems = await repository.findAll();
      set(dataAtom, allItems ?? []);

      return addResult
        ? addResult(result, items)
        : (result as unknown as AddResult);
    } catch (error) {
      const errorMessage = getErrorMessage(error, `Failed to add ${name}`);
      set(errorAtom, errorMessage);
      console.error(`Error adding ${name}:`, error);
      throw error;
    } finally {
      set(loadingAtom, false);
    }
  });

  const deleteAtom = atom(null, async (get, set, items: DeleteInput[]) => {
    if (get(loadingAtom)) return;

    set(loadingAtom, true);
    set(errorAtom, null);

    try {
      if (!items?.length) {
        throw new Error(`No ${name} provided for deletion`);
      }

      await repository.deleteMany(items);
      const allItems = await repository.findAll();
      set(dataAtom, allItems ?? []);

      return { success: true, deletedCount: items.length };
    } catch (error) {
      const errorMessage = getErrorMessage(error, `Failed to delete ${name}`);
      set(errorAtom, errorMessage);
      console.error(`Error deleting ${name}:`, error);
      throw error;
    } finally {
      set(loadingAtom, false);
    }
  });

  const deleteAllAtom = atom(null, async (get, set) => {
    if (get(loadingAtom)) return;

    set(loadingAtom, true);
    set(errorAtom, null);

    try {
      await repository.clear();
      set(dataAtom, []);

      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        `Failed to clear all ${name}`,
      );
      set(errorAtom, errorMessage);
      console.error(`Error clearing all ${name}:`, error);
      throw error;
    } finally {
      set(loadingAtom, false);
    }
  });

  const hasItemsAtom = atom((get) => get(dataAtom).length > 0);

  return {
    dataAtom,
    loadingAtom,
    errorAtom,
    loadAtom,
    addAtom,
    deleteAtom,
    deleteAllAtom,
    hasItemsAtom,
  };
};

export const createLocalRecordAtoms = <
  Item,
  CreateResult = unknown,
  AddResult = CreateResult,
  CreateInput = Item,
>({
  name,
  repository,
  addResult,
}: CreateLocalRecordAtomsOptions<Item, CreateResult, AddResult, CreateInput>) => {
  const dataAtom = atom(null) as PrimitiveAtom<Item | null | undefined>;
  const loadingAtom = atom<boolean>(false);
  const errorAtom = nullableAtom<string>();

  const loadAtom = atom(
    (get) => ({
      data: get(dataAtom),
      loading: get(loadingAtom),
      error: get(errorAtom),
    }),
    async (get, set) => {
      if (get(loadingAtom)) return;

      set(loadingAtom, true);
      set(errorAtom, null);

      try {
        const item = await repository.findFirst();
        set(dataAtom, item);
      } catch (error) {
        const errorMessage = getErrorMessage(error, `Failed to load ${name}`);
        set(errorAtom, errorMessage);
        console.error(`Error loading ${name}:`, error);
      } finally {
        set(loadingAtom, false);
      }
    },
  );

  const addAtom = atom(null, async (get, set, item: CreateInput) => {
    if (get(loadingAtom)) return;

    set(loadingAtom, true);
    set(errorAtom, null);

    try {
      if (!item) {
        throw new Error(`No ${name} data provided`);
      }

      const result = await repository.create(item);
      const savedItem = await repository.findFirst();
      set(dataAtom, savedItem);

      return addResult
        ? addResult(result, item)
        : (result as unknown as AddResult);
    } catch (error) {
      const errorMessage = getErrorMessage(error, `Failed to add ${name}`);
      set(errorAtom, errorMessage);
      console.error(`Error adding ${name}:`, error);
      throw error;
    } finally {
      set(loadingAtom, false);
    }
  });

  const deleteAtom = atom(null, async (get, set) => {
    if (get(loadingAtom)) return;

    set(loadingAtom, true);
    set(errorAtom, null);

    try {
      await repository.clear();
      set(dataAtom, null);

      return { success: true, deletedCount: -1 };
    } catch (error) {
      const errorMessage = getErrorMessage(error, `Failed to delete ${name}`);
      set(errorAtom, errorMessage);
      console.error(`Error deleting ${name}:`, error);
      throw error;
    } finally {
      set(loadingAtom, false);
    }
  });

  return {
    dataAtom,
    loadingAtom,
    errorAtom,
    loadAtom,
    addAtom,
    deleteAtom,
  };
};

export const createLocalQueueAtoms = <Item, AddInput, AddResult>({
  name,
  actions,
}: CreateLocalQueueAtomsOptions<Item, AddInput, AddResult>) => {
  const dataAtom = atom<Item[]>([]);
  const loadingAtom = atom<boolean>(false);
  const errorAtom = nullableAtom<string>();

  const loadAtom = atom(
    (get) => ({
      data: get(dataAtom),
      loading: get(loadingAtom),
      error: get(errorAtom),
    }),
    async (get, set) => {
      if (get(loadingAtom)) return;

      set(loadingAtom, true);
      set(errorAtom, null);

      try {
        const items = await actions.load();
        set(dataAtom, items ?? []);
      } catch (error) {
        const errorMessage = getErrorMessage(error, `Failed to load ${name}`);
        set(errorAtom, errorMessage);
        console.error(`Error loading ${name}:`, error);
      } finally {
        set(loadingAtom, false);
      }
    },
  );

  const addAtom = atom(null, async (get, set, input: AddInput) => {
    if (get(loadingAtom)) return;

    set(loadingAtom, true);
    set(errorAtom, null);

    try {
      const { result, items } = await actions.add(input);

      set(dataAtom, items);
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error, `Failed to add ${name}`);
      set(errorAtom, errorMessage);
      console.error(`Error adding ${name}:`, error);
      throw error;
    } finally {
      set(loadingAtom, false);
    }
  });

  const clearAtom = atom(null, async (get, set) => {
    if (get(loadingAtom)) return;

    set(loadingAtom, true);
    set(errorAtom, null);

    try {
      const items = await actions.clear();

      set(dataAtom, items ?? []);
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error, `Failed to clear ${name}`);
      set(errorAtom, errorMessage);
      console.error(`Error clearing ${name}:`, error);
      throw error;
    } finally {
      set(loadingAtom, false);
    }
  });

  const hasItemsAtom = atom((get) => get(dataAtom).length > 0);

  return {
    dataAtom,
    loadingAtom,
    errorAtom,
    loadAtom,
    addAtom,
    clearAtom,
    hasItemsAtom,
  };
};
