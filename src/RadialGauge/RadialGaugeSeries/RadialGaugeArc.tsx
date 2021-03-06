import React, { Component } from 'react';
import { arc } from 'd3-shape';
import { PieArc } from '../../PieChart';
import { ChartShallowDataShape } from '../../common/data';
import { ChartTooltip } from '../../common/TooltipArea';

export interface RadialGaugeArcProps {
  data?: ChartShallowDataShape;
  startAngle: number;
  endAngle: number;
  outerRadius: number;
  color: any;
  width: number;
  animated: boolean;
  disabled: boolean;
  tooltip: JSX.Element | null;
  onClick: (e) => void;
  onMouseEnter: (e) => void;
  onMouseLeave: (e) => void;
}

export class RadialGaugeArc extends Component<RadialGaugeArcProps> {
  static defaultProps: Partial<RadialGaugeArcProps> = {
    width: 5,
    color: '#353d44',
    animated: false,
    disabled: false,
    onClick: () => undefined,
    onMouseEnter: () => undefined,
    onMouseLeave: () => undefined,
    tooltip: <ChartTooltip />
  };

  getPaths() {
    const { outerRadius, startAngle, endAngle, width, data } = this.props;

    // Calculate the inner rad based on the width
    // and the outer rad which is height/width / 2
    const innerRadius = outerRadius - width;

    // Center arcs so inner/outer align nicely
    const delta = (outerRadius - innerRadius) / 2;
    const newInnerRad = innerRadius + delta;
    const newOuterRad = outerRadius + delta;

    // Create the arc fn to pass to the pie arc
    const innerArc = arc()
      .innerRadius(newInnerRad)
      .outerRadius(newOuterRad);

    return {
      data: {
        startAngle,
        endAngle,
        // Data must be passed
        data: data || {}
      },
      innerArc
    };
  }

  render() {
    const { color, animated, disabled, tooltip, onClick, onMouseEnter, onMouseLeave } = this.props;
    const data = this.getPaths();

    return (
      <PieArc
        {...data}
        animated={animated}
        color={color}
        disabled={disabled}
        tooltip={tooltip}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    );
  }
}
