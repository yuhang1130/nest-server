import _ from "lodash";

export function getErrMsg(e: Error): string {
  return e?.message || JSON.stringify(e);
}

export async function Sleep(seconds: number): Promise<void> {
  await new Promise((ok) => {
    setTimeout(ok, seconds * 1e3);
  });
}

export async function SleepMS(ms: number): Promise<void> {
  await new Promise((ok) => {
    setTimeout(ok, ms);
  });
}

export async function DestructureAllSettled(
  promises: Array<Promise<any>>,
  limit = 20
) {
  const result = {
    fulfilled: [],
    rejected: [],
  };
  if (!promises.length) {
    return result;
  }

  const promisesCopy = promises.slice(0);
  do {
    const stepItems = promisesCopy.splice(0, limit);
    const res = await Promise.allSettled(stepItems);
    result.fulfilled.push(
      ..._.flatten(
        res
          .filter((result) => result.status === "fulfilled")
          .map((result: any) => result.value)
      )
    );
    result.rejected.push(
      ..._.flatten(
        res
          .filter((result) => result.status === "rejected")
          .map((result: any) => result.reason)
      )
    );
    await SleepMS(100);
  } while (promisesCopy.length);

  return result;
}
