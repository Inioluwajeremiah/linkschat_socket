import { useCallback, useState } from "react";
import { getLocales } from "expo-localization";
import * as Contacts from "expo-contacts";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useToast } from "../context/ToastContext";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { store } from "../store";
import { contactsSyncApi } from "../services/api";
import {
  loadDeviceContacts,
  MatchedContact,
  setMatchedContacts,
} from "../store/slices/contactsSlice";

export type { MatchedContact };

interface UseContactSyncResult {
  matchedContacts: MatchedContact[];
  totalPhoneContacts: number;
  syncing: boolean;
  syncContacts: () => Promise<void>;
}

const noop = () => "";
const silentToast = {
  loading: noop,
  dismiss: noop,
  info: noop,
  success: noop,
  error: noop,
};

// One sync at a time app-wide — a second caller just waits for it.
let inFlight: Promise<void> | null = null;

// `silent`: no toasts. For background syncs (the chats tab syncs on every
// open) — only screens where the user asked to sync should report on it.
export function useContactSync({
  silent = false,
}: { silent?: boolean } = {}): UseContactSyncResult {
  const realToast = useToast();
  const dispatch = useAppDispatch();

  // Kept in Redux so every screen sees the latest sync, wherever it ran.
  const { matchedContacts, totalPhoneContacts } = useAppSelector(
    (s) => s.contacts
  );
  const [syncing, setSyncing] = useState(false);

  const syncContacts = useCallback(async () => {
    if (inFlight) return inFlight;
    inFlight = runSync().finally(() => {
      inFlight = null;
    });
    return inFlight;
  }, [realToast, dispatch, silent]);

  // Reads owner/device-name state at call time rather than closing over it,
  // so syncContacts keeps one identity — effects that depend on it (the
  // chats tab's load-on-open) no longer re-run, and re-sync, whenever the
  // user object or contact map updates.
  async function runSync() {
    const toast = silent ? silentToast : realToast;
    const owner = store.getState().auth.user;
    const hasDeviceNames =
      Object.keys(store.getState().contacts.phoneToName).length > 0;
    setSyncing(true);
    const syncId = toast.loading("Syncing contacts...");
    try {
      const locales = getLocales();

      const deviceCountry =
        locales.length > 0 && locales[0].regionCode
          ? locales[0].regionCode
          : "";
      const { data: phoneContacts } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });
      const ownerCountry = owner?.phone
        ? parsePhoneNumberFromString(owner.phone)?.country
        : deviceCountry;

      const phoneToName: Record<string, string> = {};
      const allNumbers: string[] = [];

      for (const contact of phoneContacts) {
        if (!contact.name || !contact.phoneNumbers?.length) continue;
        for (const pn of contact.phoneNumbers) {
          if (pn.number) {
            const num = pn.number.replace(/[\s\-().]/g, "");
            allNumbers.push(num);
            phoneToName[num] = contact.name;
          }
        }
      }

      if (allNumbers.length === 0) {
        toast.dismiss(syncId!);
        toast.info(
          "No phone numbers found",
          "Your contacts have no phone numbers stored"
        );
        setSyncing(false);
        return;
      }

      const chunkSize = 500;
      const allMatched: MatchedContact[] = [];

      for (let i = 0; i < allNumbers.length; i += chunkSize) {
        const chunk = allNumbers.slice(i, i + chunkSize);
        const res = await contactsSyncApi.sync(
          chunk,
          ownerCountry || deviceCountry,
          chunk.map((n) => phoneToName[n] || "")
        );
        if (res.success) {
          const mapped: MatchedContact[] = res.data.users.map((u) => {
            const matchedNum = allNumbers.find((n) => {
              const userPhone = (u.phone || "").replace(/[\s\-().]/g, "");
              return (
                userPhone.endsWith(n.slice(-9)) ||
                n.endsWith(userPhone.slice(-9))
              );
            });
            const phoneName = matchedNum
              ? phoneToName[matchedNum] || u.name
              : u.name;
            return { ...u, phoneName };
          });
          allMatched.push(...mapped);
        }
      }

      const seen = new Set<string>();
      const unique = allMatched.filter((c) => {
        if (seen.has(c._id)) return false;
        seen.add(c._id);
        return true;
      });

      unique.sort((a, b) => {
        if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      dispatch(
        setMatchedContacts({
          matchedContacts: unique,
          totalPhoneContacts: phoneContacts.length,
        })
      );
      // We just read contacts with permission — if the device-name map used
      // to show saved names is still empty (its first load ran before
      // permission was granted, e.g. on sign-up), build it now.
      if (!hasDeviceNames) dispatch(loadDeviceContacts({ force: true }));
      toast.dismiss(syncId!);

      if (unique.length > 0) {
        toast.success(
          `${unique.length} friend${
            unique.length !== 1 ? "s" : ""
          } on LinksChat`,
          `Out of ${phoneContacts.length} contacts`
        );
      } else {
        toast.info(
          "No matches found",
          `None of your ${phoneContacts.length} contacts are on LinksChat yet`
        );
      }
    } catch (err) {
      toast.dismiss(syncId!);
      toast.error("Sync failed", "Could not load contacts. Please try again.");
    } finally {
      setSyncing(false);
    }
  }

  return { matchedContacts, totalPhoneContacts, syncing, syncContacts };
}
