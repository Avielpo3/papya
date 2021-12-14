
type PromiseFunc<T> = (() => Promise<T>) | undefined;

class ParallelPromise<T> {
  private funcArr: PromiseFunc<T>[] = [];
  private results: T[] = [];

  add(func: PromiseFunc<T>): void {
    this.funcArr.push(func);
  }

  async getResults(maxConcurrent: number): Promise<T[]> {
    const workerResultArr: Promise<void>[] = [];
    for (let i = 0; i < maxConcurrent; i++) {
      const worker = this.runNext(this.funcArr);
      workerResultArr.push(worker());
    }

    await Promise.all(workerResultArr);

    return this.results;
  }

  runNext = (arr: PromiseFunc<T>[]) => async () => {
    let next: PromiseFunc<T>;
    while ((next = arr.pop())) {
      const res: T = await next();
      this.results.push(res);
    }
  };
}

async function testEx(){
  const promisePool = new ParallelPromise<number>();

  for (let i = 0; i < 50; i++) {
    const asyncFunction = function (): Promise<number> {
      console.log(`[${i}]Started`);
      return new Promise((res, rej) => {
        setTimeout(() => {
          const result = Math.floor(Math.random() * 100);
          console.log(`[${i}]Done, with result:${result}`);
          res(result);
        }, 1000 + Math.random() * 100);
      });
    };
    promisePool.add(asyncFunction);
  }
  
  // test
  const results = await promisePool.getResults(10);
  results.forEach((element, index) => {
    console.log(`Index:${index}, The Result:${element}`);
    
  });
}

testEx();

