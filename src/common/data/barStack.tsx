import { stack, stackOffsetExpand } from 'd3-shape';
import { ChartNestedDataShape, ChartInternalNestedDataShape } from './types';
import { getDeepGroupDomain } from '../utils/domains';
import {
  getMaxBigIntegerForNested,
  normalizeValue,
  normalizeValueForFormatting
} from './bigInteger';

/**
 * Given a dataset like:
 *
 *   [{
 *    key: 'Threat Intel',
 *    data: [{ key:'2011', data: 25 }]
 *   }]
 *
 * it will transform it to:
 *
 *  [
 *    { x: 'Theat Intel', '2011': 25 }
 *  ]
 */
function transformDataToStack(data: ChartNestedDataShape[]) {
  const result: any[] = [];
  const maxBigInteger = getMaxBigIntegerForNested(data);

  for (const category of data) {
    for (const value of category.data) {
      let idx = result.findIndex(r => {
        if (r.x instanceof Date && category.key instanceof Date) {
          return r.x.getTime() === category.key.getTime();
        }
        return r.x === category.key;
      });

      if (idx === -1) {
        result.push({
          x: category.key,
          formattedValues: {}
        });

        idx = result.length - 1;
      }

      result[idx][value.key as string] = normalizeValue(
        value.data,
        maxBigInteger
      );

      result[idx].formattedValues[
        value.key as string
      ] = normalizeValueForFormatting(value.data);
    }
  }

  return result;
}

/**
 * Translates the stack data to a chart standard dataset.
 */
function transformStackToData(stackData, direction = 'vertical'): ChartInternalNestedDataShape[] {
  const result: ChartInternalNestedDataShape[] = [];
  const isVertical = direction === 'vertical';

  // Transform the data from the d3 stack format to our internal format
  for (const category of stackData) {
    for (const point of category) {
      const key = point.data.x;

      let idx = result.findIndex(r => {
        if (r.key instanceof Date && key instanceof Date) {
          return r.key.getTime() === key.getTime();
        }
        return r.key === key;
      });

      if (idx === -1) {
        result.push({
          key,
          data: []
        });

        idx = result.length - 1;
      }

      const categoryKey = category.key;
      const y = point.data[categoryKey];
      const [y0, y1] = point;

      result[idx].data.push({
        key,
        x: isVertical ? categoryKey : y1,
        x0: isVertical ? categoryKey : y0,
        x1: isVertical ? categoryKey : y1,
        y: isVertical ? y : categoryKey,
        y0: isVertical ? y0 : categoryKey,
        y1: isVertical ? y1 : categoryKey,
        value: point.data.formattedValues[categoryKey]
      });
    }
  }

  return result;
}

/**
 * Builds a stack dataset from the standard data format.
 */
export function buildBarStackData(
  data: ChartNestedDataShape[],
  normalized = false,
  direction = 'vertical'
) {
  const keys = getDeepGroupDomain(data, 'key');
  const stackData = transformDataToStack(data);
  const stackFn = !normalized ? stack() : stack().offset(stackOffsetExpand);
  const result = stackFn.keys(keys)(stackData);

  return transformStackToData(result, direction);
}
