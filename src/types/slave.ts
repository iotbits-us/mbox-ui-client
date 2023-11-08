import { Reg16, Reg32, SlaveFunction } from "./manifest";

export type Slave = {
  id: number;
  type: string;
  address: number;
  manifest_id: number;
  name: string;
  enabled: boolean;
  baud_rate: number;
  remote_ctrl_enabled: boolean;
  remote_spdctrl_enabled: boolean;
  regs16: number[];
  regs32: number[];
};

export type SlaveEnriched = Omit<Slave, "regs16" | "regs32"> & {
  id: number;
  functions: SlaveFunction[];
  regs16: Reg16[];
  regs32: Reg32[];
};
