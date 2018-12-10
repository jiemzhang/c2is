import { Component, IterableDiffers, DoCheck, AfterContentInit} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements DoCheck, AfterContentInit {

  reportDate: string = (new Date() ).toLocaleDateString();
  score = 0;
  grade = 'N/A';
  gradeClass = 'red';
  numSubmitted = 0;
  numAssigned = 0;

  differ: any;
  assignments: Assignment[] = [
    {
      index : 1,
      name: 'assignment one',
      percentageScore: 90,
      status: 'submitted',
      weight: 1
    },
    {
      index : 2,
      name: 'assignment one',
      percentageScore: 85,
      status: 'submitted',
      weight: 1
    },
    {
      index : 3,
      name: 'assignment one',
      percentageScore: 100,
      status: 'submitted',
      weight: 1
    },
    {
      index : 4,
      name: 'assignment one',
      percentageScore: 70,
      status: 'submitted',
      weight: 1
    },
    {
      index : 5,
      name: 'assignment one',
      percentageScore: 80,
      status: 'submitted',
      weight: 1
    },
    {
      index : 6,
      name: 'assignment one',
      percentageScore: 85,
      status: 'submitted',
      weight: 1
    },
    {
      index : 7,
      name: 'assignment one',
      percentageScore: 0,
      status: 'assigned',
      weight: 1
    },
    {
      index : 8,
      name: 'assignment one',
      percentageScore: 0,
      status: 'assigned',
      weight: 1
    },
    {
      index : 9,
      name: 'assignment one',
      percentageScore: 0,
      status: 'assigned',
      weight: 1
    },
    {
      index : 10,
      name: 'assignment one',
      percentageScore: 0,
      status: 'assigned',
      weight: 1
    }
  ];

  // chart properties
  width = 900;
  height = 350;
  margin = {top: 20, right: 20, bottom: 50, left: 60};
  xScale: any = null;
  yScale: any = null;
  chart: any = null;
  line: any = null;

  // selected item
  selectedAssnIdx: number;
  displayAssn: Assignment;

  // slider
  sliderVal = 0;
  sliderDisabled = true;
  invert = false;
  max = 100;
  min = 0;
  step = 1;
  thumbLabel = true;

  constructor(differs: IterableDiffers) {
    this.differ = differs.find([]).create(null);
  }

  ngDoCheck() {
    const change = this.differ.diff(this.assignments);

    this.numSubmitted = this.assignments.filter( assn => assn.status === 'submitted' ).length;
    this.numAssigned = this.assignments.length;
    const sumOfScoreAndWeight = this.assignments
      .map(item => {
        return {
          weightedScore: (item.percentageScore * item.weight ) || 0,
          weight: item.weight || 0
        };
      })
      .reduce((a, b) => {
        return{
          weightedScore: a.weightedScore + b.weightedScore,
          weight: a.weight + b.weight
        };
      }, {weightedScore: 0, weight: 0});

    this.score = sumOfScoreAndWeight.weightedScore / sumOfScoreAndWeight.weight;

    switch (true) {
      case (this.score >= 90) :
        this.grade = 'A';
        this.gradeClass = 'green';
        break;
      case (this.score >= 80):
        this.grade = 'B';
        this.gradeClass = 'blue';
        break;
      case (this.score >= 70):
        this.grade = 'C';
        this.gradeClass = 'orange';
        break;
      case (this.score >= 60):
        this.grade = 'D';
        this.gradeClass = 'red';
        break;
      default:
        this.grade = 'F';
        this.gradeClass = 'red';
    }

    if (this.chart) {
      this.drawChart(this.assignments);
    }
  }

  ngAfterContentInit() {

    const xTickSize = this.height - this.margin.top - this.margin.bottom;
    const yTickSize = this.width - this.margin.left - this.margin.right;
    const marginLeft = this.margin.left;
    const marginRight = this.margin.right;
    const marginBottom = this.margin.bottom;
    const marginTop = this.margin.top;
    const height = this.height;
    const width = this.width;

    this.xScale = d3.scaleLinear()
      .domain([1, this.assignments.length])
      .range([marginLeft, width - marginRight]);

    this.yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - marginBottom, marginTop]);

    const x = this.xScale;
    const y = this.yScale;

    this.chart = d3.select('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');

    this.line = d3.line()
      .x( function(d) { return x(d.index); })
      .y( function(d) { return y(d.percentageScore); });

    this.chart.append('g')
      .attr('class', 'yAxis')
      .call(d3.axisLeft(y).tickSize( - yTickSize).tickValues([0, 20, 40, 60, 80, 100]))
      .attr('transform', 'translate(' + marginLeft + ', 0)')
      .append('text')
      .attr('fill', '#000')
      .attr('transform', 'translate(' + - (marginLeft / 2) + ',' + (height - 250) + ')rotate(-90)')
      .attr('font-size', 20)
      .text('Score (%)');

    this.chart.append('g')
      .attr('transform', 'translate(0,' + (height - marginBottom) + ')')
      .call(d3.axisBottom(x).tickSize( - xTickSize))
      .append('text')
      .attr('fill', '#000')
      .attr('transform', 'translate(' + (width / 2) + ',' + (marginBottom - 10)  + ')')
      .attr('font-size', 20)
      .text('Assignments');
    ;

    this.chart.selectAll('.tick line').attr('stroke', '#ddd');

    this.chart.append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', 1.5);

    this.chart.selectAll('circle')
      .data(this.assignments)
      .enter().append('circle')
      .attr('class', (d) => {
        return 'assn' + d.index;
      })
      .attr('stroke', 'blue')
      .attr('cursor', 'pointer')
      .attr('fill', d => (d.status === 'submitted') ? 'blue' : 'lightblue' )
      .attr('r', 10)
      .attr('cx', d => x(d.index))
      .attr('cy', d => y(d.percentageScore))
      .on('click', (d) => this.handleClick(d));


    this.drawChart(this.assignments);
  }

  drawChart(data: Assignment[]) {

    const line = this.line;

    const x = this.xScale;
    const y = this.yScale;
    x.domain([1, data.length]);

    this.chart.select('.line')
      .transition()
      .duration(100)
      .attr('d', line(data));

    d3.selectAll('circle') // move the circles
      .transition().duration(100)
      .attr('cy', d => y(d.percentageScore));

  }

  handleClick(d) {  // Add interactivity

    const assnClass = '.assn' + d.index;
    this.chart.selectAll('circle').attr('r', '10');
    // Use D3 to select element, change color and size
    this.chart.select(assnClass).attr('r', '15');

    this.selectedAssnIdx = d.index;
    this.displayAssn = d;
    if ( d.status !== 'submitted') {
      this.sliderDisabled = false;
      this.sliderVal = d.percentageScore;
    } else {
      this.sliderDisabled = true;
      this.sliderVal = 0;
    }
  }

  sliderChanged($event: any) {
    console.log($event);

    const newValue = $event.value;
    // this.assignments[this.selectedAssnIdx].percentageScore = newValue;
    this.displayAssn.percentageScore = newValue;

  }

}

interface Assignment {
  index: number;
  name: string;
  percentageScore: number;
  status: string;
  weight: number;
}

