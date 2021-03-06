import React, { Component, Fragment, createRef } from 'react';
import { PosedArc } from './PosedArc';
import bind from 'memoize-bind';
import chroma from 'chroma-js';
import { ChartTooltip, ChartTooltipProps } from '../../../common/TooltipArea';
import { CloneElement } from '../../../common/utils/children';

export interface PieArcProps {
  data: any;
  animated: boolean;
  color: any;
  tooltip: JSX.Element | null;
  cursor: string;
  innerArc: any;
  disabled: boolean;
  onClick: (e) => void;
  onMouseEnter: (e) => void;
  onMouseLeave: (e) => void;
}

interface PieArcState {
  active: boolean;
}

export class PieArc extends Component<PieArcProps, PieArcState> {
  static defaultProps: Partial<PieArcProps> = {
    cursor: 'initial',
    disabled: false,
    onClick: () => undefined,
    onMouseEnter: () => undefined,
    onMouseLeave: () => undefined,
    tooltip: <ChartTooltip />
  };

  previousEnter?: any;
  arc = createRef<SVGPathElement>();
  state: PieArcState = {
    active: false
  };

  getExitProps() {
    const { data, animated } = this.props;
    const startAngle = data.startAngle;
    const endAngle = animated ? startAngle : data.endAngle;

    return {
      ...data,
      startAngle,
      endAngle
    };
  }

  onMouseEnter(event: MouseEvent) {
    const { onMouseEnter, data, disabled } = this.props;

    if (!disabled) {
      this.setState({ active: true });

      onMouseEnter({
        value: data.data,
        nativeEvent: event
      });
    }
  }

  onMouseLeave(event: MouseEvent) {
    const { onMouseLeave, data, disabled } = this.props;

    if (!disabled) {
      this.setState({ active: false });

      onMouseLeave({
        value: data.data,
        nativeEvent: event
      });
    }
  }

  onMouseClick(event: MouseEvent) {
    const { onClick, data, disabled } = this.props;

    if (!disabled) {
      onClick({
        value: data.data,
        nativeEvent: event
      });
    }
  }

  render() {
    const { animated, color, data, tooltip, cursor, innerArc } = this.props;
    const { active } = this.state;
    const exitProps = this.getExitProps();
    const key = innerArc(data);
    const fill = active ? chroma(color).brighten(0.5) : color;

    // Cache the previous for transition use later
    const previousEnter = this.previousEnter
      ? { ...this.previousEnter }
      : undefined;
    this.previousEnter = { ...data };

    return (
      <Fragment>
        <PosedArc
          pose="enter"
          poseKey={key}
          style={{ cursor }}
          ref={this.arc}
          animated={animated}
          previousEnter={previousEnter}
          onMouseEnter={bind(this.onMouseEnter, this)}
          onMouseLeave={bind(this.onMouseLeave, this)}
          onClick={bind(this.onMouseClick, this)}
          arc={innerArc}
          enterProps={data}
          exitProps={exitProps}
          fill={fill}
        />
        {tooltip && !tooltip.props.disabled && (
          <CloneElement<ChartTooltipProps>
            element={tooltip}
            visible={!!active}
            reference={this.arc}
            value={{ y: data.data.data, x: data.data.key }}
          />
        )}
      </Fragment>
    );
  }
}
