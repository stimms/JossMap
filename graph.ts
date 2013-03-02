declare var d3: any;
declare var $: any;

module Graphing
{
  export class ForceGraph{

    constructor(public width: number, public height: number){
      
    }

    render()
    {
      var force = d3.layout.force()
          .charge(-220)
          .linkDistance(220)
          .size([this.width, this.height]);

      var svg = d3.select("body").append("svg")
          .attr("width", this.width)
          .attr("height", this.height);

      
      d3.json("data.json", (error, graph) => {
        
        var links = this.setUpLinks(graph);
        force
            .nodes(graph.nodes)
            .links(links)
            .start();

        var link = svg.selectAll(".link")
            .data(links)
          .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.selectAll(".node")
            .data(graph.nodes)
          .enter().append("circle")
            .attr("class", "node")
            .attr("r", 15)
            .attr("data-types", d => {
                var result = "";
                $.each(d.Productions, (_, production) => {
                    result += production.Type + " ";
                  }
                );
                return result;
              })
            .attr("data-productions", d => {
                var result = "";
                $.each(d.Productions, (_, production) => {
                    result += production.Name.replace(/\s/g, "").replace("'","") + " ";
                  }
                );
                return result;
              })
            .style("fill", "steelblue")
            .call(force.drag);

        node.append("title")
            .text(function(d) { return d.Name; });

        force.on("tick", function() {
          link.attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          node.attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
        });
      });
    }

  setUpLinks(graph)
    {
      var links = new Array();
      for(var i = 0; i<graph.nodes.length; i++)
      {
        for(var j = i; j<graph.nodes.length; j++)
        {
          if(i!=j)
          {
            var strength = 0;
            $.each(graph.nodes[i].Productions, (_, source) =>
            {
              $.each(graph.nodes[j].Productions, (_, target) =>
              {
                if(source.Name == target.Name)
                {
                  strength+=1;
                }
              })
            });
            if(strength > 0)
              links.push({"source": i, "target": j, "value": strength});
          }
        } 
      }
      return links;
    }    
  }
}
