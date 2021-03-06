// export function max

import {
  isRuleModel,
  ModelBase,
  Rule,
  Condition,
} from '../models';

export function countFeatureFreq(model: ModelBase, nFeatures: number): (number | undefined)[] {

  const counts = new Array(nFeatures);
  counts.fill(0);
  if (isRuleModel(model)) {
    model.rules.forEach((rule: Rule) => {
      rule.conditions.forEach((c: Condition) => {
        counts[c.feature]++;
      });
    });
  }

  return counts;
}

const MAX_STR_LEN = 16;
const CUT_SIZE = (MAX_STR_LEN - 2) / 2;

export function condition2String(
  featureName: string, 
  category: (number | null)[] | number
): { tspan: string; title: string } {
  const abrString = featureName.length > MAX_STR_LEN
    ? `"${featureName.substr(0, CUT_SIZE)}…${featureName.substr(-CUT_SIZE, CUT_SIZE)}"`
    : featureName;
  let featureMap = (feature: string): string => `${feature} is any`;
  if (typeof category === 'number') {
    featureMap = (feature: string) => `${feature} = ${category}`;
  } else {
    const low = category[0];
    const high = category[1];
    if (low === null && high === null) featureMap = (feature: string) => `${feature} is any`;
    else {
      const lowString = low !== null ? `${low.toPrecision(3)} < ` : '';
      const highString = high !== null ? ` < ${high.toPrecision(3)}` : '';
      featureMap = (feature: string) => lowString + feature + highString;
    }
  }
  return {
    tspan: featureMap(abrString),
    title: featureMap(featureName)
  };
}

// export function registerStripePattern(
//   svg: SVGSVGElement, color: string, strokeWidth: number = 2, padding: number = 4
// ): string {
//   const defs = d3.select(svg).select('defs');
//   const patternName = `stripe-${color.slice(1)}-${strokeWidth}-${padding}`;
//   const patternNode = defs.select(`#${patternName}`).node();
//   const pattern = patternNode === null 
//     ? defs.append('pattern').attr('id', patternName)
//     : defs.select(`#${patternName}`);
//   pattern.attr('width', padding).attr('height', padding)
//     .attr('patternUnits', 'userSpaceOnUse')
//     .attr('patternTransform', 'rotate(-45)');

//   const path = pattern.select('path').node() === null
//     ? pattern.append('path') : pattern.select('path');
//   path.attr('d', `M 0 ${padding / 2} H ${padding}`)
//     .style('stroke-linecap', 'square')
//     .style('stroke-width', `${strokeWidth}px`)
//     .style('stroke', color);
//   // defs.append('pattern')
//   return patternName;
// }

export interface Cache<T> {
  count: number;
  data: T;
}

// export function memorize<T>()

export function memorizePromise<T>(
  f: (...a: any[]) => Promise<T>
): (...a: any[]) => Promise<T> {
  const cache: {[key: string]: Cache<T>} = {};
  return function (...a: any[]) {
    const key = a.map((e) => JSON.stringify(a)).join(',');
    if (key in cache)
      return Promise.resolve<T>(cache[key].data);
    else
      return f(...a).then((data) => {
        cache[key] = {data, count: 0};
        return data;
      });
  };
}
