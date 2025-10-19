import { Transaction } from "@mysten/sui/transactions";

export const transferHero = (heroId: string, to: string) => {
  const tx = new Transaction();
  
  tx.transferObjects([tx.object(heroId)], tx.pure.address(to));

  return tx;
};
