import React, { Component, ReactNode } from 'react';
import { ChartInternalShallowDataShape } from '../../common/data';
import { radialLine } from 'd3-shape';
import { PosedGroupTransform } from '../../common/utils/animations';

export interface RadialScatterPointProps {
  data: ChartInternalShallowDataShape;
  index: number;
  animated: boolean;
  xScale: any;
  yScale: any;
  fill: string;
  id: string;
  className?: any;
  symbol: ((value) => ReactNode);
  size?: ((d) => number) | number;
}

export class RadialScatterPoint extends Component<RadialScatterPointProps> {
  static defaultProps: Partial<RadialScatterPointProps> = {
    size: 3
  };

  getTranslate(data: ChartInternalShallowDataShape) {
    const { xScale, yScale } = this.props;

    const fn = radialLine()
      .radius((d: any) => yScale(d.y))
      .angle((d: any) => xScale(d.x));

    // Parse the generated path to get point coordinates
    // Ref: https://bit.ly/2CnZcPl
    const path = fn([data] as any);
    const coords = path.slice(1).slice(0, -1);
    const transform = `translate(${coords})`;

    return transform;
  }

  render() {
    const { size, data, fill, index, animated, symbol } = this.props;
    const transform = this.getTranslate(data);
    const exitTransform = this.getTranslate({ ...data, y: 0 });
    const sizeVal = typeof size === 'function' ? size(data) : size;

    return (
      <PosedGroupTransform
        enterProps={{ transform }}
        index={index}
        animated={animated}
        exitProps={{ transform: exitTransform }}
      >
        {symbol && symbol(data)}
        {!symbol && (
          <circle
            r={sizeVal}
            fill={fill}
          />
        )}
      </PosedGroupTransform>
    );
  }
}
