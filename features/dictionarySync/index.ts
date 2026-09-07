export { useDictionaryActions } from "./lib/useDictionaryActions";
// useDictionaryGuard/dictionarySyncService/dictionaryReadinessService are
// intentionally NOT re-exported here: useDictionaryGuard pulls in
// useNetworkStatus + useLocalData (db-backed), and nothing outside this
// feature imports them directly today — only useDictionaryActions (pure api
// wrapper) is a real cross-file consumer.
