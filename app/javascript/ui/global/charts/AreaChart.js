import PropTypes from 'prop-types'
import { VictoryArea } from 'victory'

import ChartTooltip from '~/ui/global/charts/ChartTooltip'
import {
  datasetPropType,
  utcMoment,
  maxDomainForDataset,
  renderTooltip,
} from '~/ui/global/charts/ChartUtils'

const formatValues = rawValues => {
  const mappedValues = rawValues.map((value, i) => ({
    ...value,
    month: value.date,
  }))

  // We need to add a duplicate value if there is only 1 value,
  // to properly display an area chart
  if (mappedValues.length === 1) {
    const duplicateValue = Object.assign({}, this.primaryValues[0])
    duplicateValue.date = utcMoment(duplicateValue.date)
      .subtract('3', 'months')
      .format('YYYY-MM-DD')
    duplicateValue.month = duplicateValue.date
    duplicateValue.isDuplicate = true
    mappedValues.push(duplicateValue)
  }

  return mappedValues
}

const chartStyle = dataset => {
  const { fill } = dataset
  if (fill) {
    return {
      data: { fill },
      labels: {
        fontSize: 18,
      },
    }
  }
  return {
    data: { fill: 'url(#organicGrid)' },
    labels: {
      fill: 'black',
    },
  }
}

const AreaChart = ({ dataset, showMeasureInTooltip, cardArea = 1 }) => {
  const { measure, timeframe } = dataset
  const values = formatValues(dataset.data)
  const maxDomain = maxDomainForDataset(dataset)
  const tooltipMeasure = showMeasureInTooltip ? measure : null
  const tooltipFn = (datum, isLastDataPoint) =>
    renderTooltip({
      datum,
      isLastDataPoint,
      timeframe,
      measure: tooltipMeasure,
    })
  return (
    <VictoryArea
      labels={d => d.value}
      labelComponent={
        <ChartTooltip textRenderer={tooltipFn} cardArea={cardArea} />
      }
      style={chartStyle(dataset)}
      data={values}
      // This makes the chart shape based on the values
      domain={maxDomain}
      y="value"
      x="month"
    />
  )
}

AreaChart.propTypes = {
  dataset: datasetPropType.isRequired,
  showMeasureInTooltip: PropTypes.bool,
  cardArea: PropTypes.number,
}

AreaChart.defaultProps = {
  cardArea: 1,
  showMeasureInTooltip: false,
}

export default AreaChart
