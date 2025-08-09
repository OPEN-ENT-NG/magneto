import { Sensor, SensorProps, UniqueIdentifier } from "@dnd-kit/core";

type RemoteSensorOptions = {};

type Coordinates = {
  x: number;
  y: number;
};

type RemoteDragStartPayload = {
  active: { id: UniqueIdentifier };
  coordinates?: Coordinates;
};

type RemoteDragMovePayload = {
  coordinates?: Coordinates;
};

type RemoteDragEndPayload = {};

let activeSensor: SensorProps<RemoteSensorOptions> | null = null;

class RemoteSensorClass {
  autoScrollEnabled = false;

  constructor(props: SensorProps<RemoteSensorOptions>) {
    activeSensor = props;
  }

  static start(payload: RemoteDragStartPayload) {
    if (activeSensor) {
      activeSensor.onStart(payload.coordinates ?? { x: 0, y: 0 });
    }
  }

  static move(payload: RemoteDragMovePayload) {
    if (activeSensor) {
      activeSensor.onMove(payload.coordinates ?? { x: 0, y: 0 });
    }
  }

  static end() {
    if (activeSensor) {
      activeSensor.onEnd();
    }
  }

  static cancel() {
    if (activeSensor) {
      activeSensor.onCancel();
    }
  }
}

export const RemoteSensor: Sensor<RemoteSensorOptions> = {
  activators: [],
  setup() {
    return () => {
      activeSensor = null;
    };
  },
  create(props: SensorProps<RemoteSensorOptions>) {
    return new RemoteSensorClass(props);
  },
};

export const triggerRemoteDragStart = (payload: RemoteDragStartPayload) => {
  RemoteSensorClass.start(payload);
};

export const triggerRemoteDragMove = (payload: RemoteDragMovePayload) => {
  RemoteSensorClass.move(payload);
};

export const triggerRemoteDragEnd = () => {
  RemoteSensorClass.end();
};

export const triggerRemoteDragCancel = () => {
  RemoteSensorClass.cancel();
};

export const remoteSensorDescriptor = {
  sensor: RemoteSensor,
  options: {},
};
