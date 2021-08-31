import { visit } from "unist-util-visit"

import find from "unist-util-find"

export default () => tree => {
  let headings = []
  
  visit(
    tree,
    node => node.type === "heading" && node.depth > 1,
    (node, index, parent) => {
      if (node.depth === 2) {
        headings.push({
          id: node.data.id,
          text: node.children[0].value,
          children: [],
        })
      } else if (node.depth > 2) {
        let latest_h2 = headings[headings.length - 1]
        latest_h2.children.push({
          id: node.data.id,
          text: node.children[0].value
        })
      }
    }
  )
 
  headings = headings.map((heading, i) => ({
    type: "listItem",
    children: [
      {
        type: "link",
        url: `#${heading.id}`,
        children: [
          {
            type: "html",
            value: `<span>${i + 1}.</span>`
          },
          {
            type: "text",
            value: heading.text
          }
        ]
      },
      heading.children && {
        type: "list",
        ordered: false,
        children: heading.children.map((child, j) => ({
          type: "listItem",
          children: [
            {
              type: "link",
              url: `#${child.id}`,
              children: [
                {
                  type: "html",
                  value: `<span>${i + 1}.${j + 1}</span>`
                },
                {
                  type: "text",
                  value: child.text
                }
              ]
            }
          ]
        }))
      }
    ]
  }))

  let contents = {
    type: "parent",
    children: [
      {
        type: "html",
        value: `<input id="contents" type="checkbox" checked><label for="contents">Obsah<span class="circle"><span class="arrow"></span></span></label>`
      },
      {
        type: "parent",
        data: {
          hName: "nav",
        },
        children: [
          {
            type: "list",
            ordered: false,
            children: headings,
          }
        ]
      }
    ],
    data: {
      hName: "section",
      hProperties: {
        className: ["contents"]
      },
    }
  }

  let first_section = find(tree, { data: { hName: "section" } })
  let index = tree.children.indexOf(first_section)

  tree.children.splice(index, 0, contents)
}