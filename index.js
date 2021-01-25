const main = async () => {
    const response = await fetch(
        'https://gw.alipayobjects.com/os/basement_prod/6cae02ab-4c29-44b2-b1fd-4005688febcb.json',
    );
    const remoteData = await response.json();

    const nodes = remoteData.nodes;

    nodes.forEach((node) => {
        if (!node){
            node.style = {};
        }
        switch(
            node.class
            ) {
            case 'c0': {
                node.type = 'circle';   // class = 'c0' 时节点图形为 circle
                node.size = 30;
                node.style = {
                    fill: 'green',
                    opacity: 0.3,
                    stroke: '#fff'
                }
                break;
            }
            case 'c1': {
                node.type = 'star';   // class = 'c1' 时节点图形为 star
                node.size = node.size = [20, 10];
                node.style = {
                    fill: 'red',
                    opacity: 0.3,
                    stroke: '#fff'
                }
                break;

            }
            case 'c2': {
                node.type = 'rect';
                node.size = 30;
                node.style = {
                    fill: 'yellow',
                    opacity: 0.3,
                    stroke: '#fff'
                }
                break;
            }
        }
    });

    G6.registerEdge(
        'circle-running',
        {
            afterDraw(cfg, group) {
                // get the first shape in the group, it is the edge's path here=
                const shape = group.get('children')[0];
                // the start position of the edge's path
                const startPoint = shape.getPoint(0);

                // add red circle shape
                const circle = group.addShape('circle', {
                    attrs: {
                        x: startPoint.x,
                        y: startPoint.y,
                        fill: '#1890ff',
                        r: 3,
                    },
                    name: 'circle-shape',
                });

                // animation for the red circle
                circle.animate(
                    (ratio) => {
                        // the operations in each frame. Ratio ranges from 0 to 1 indicating the prograss of the animation. Returns the modified configurations
                        // get the position on the edge according to the ratio
                        const tmpPoint = shape.getPoint(ratio);
                        // returns the modified configurations here, x and y here
                        return {
                            x: tmpPoint.x,
                            y: tmpPoint.y,
                        };
                    },
                    {
                        repeat: true, // Whether executes the animation repeatly
                        duration: 3000, // the duration for executing once
                    },
                );
            },
        },
        'cubic', // extend the built-in edge 'cubic'
    );

    const minimap = new G6.Minimap();
    const graph = new G6.Graph({
            container: 'mountNode',
            // 指定图画布的容器 id，与第 9 行的容器对应
            // 画布宽高
            width: 1200,
            height: 900,
            // fitView: true,
            // fitViewPadding: [20, 40, 50, 20],
            animate: true,
            plugins: [minimap],
            defaultEdge: {
                type: 'circle-running',
                style: {
                    lineWidth: 2,
                    stroke: '#bae7ff',
                },
                labelCfg: {           // 标签配置属性
                    //  positions: 'center',// 标签的属性，标签在元素中的位置
                    style: {            // 包裹标签样式属性的字段 style 与标签其他属性在数据结构上并行
                        autoRotate: true,
                    }
                }
            },

            layout: {
                type: 'force',
                preventOverlap: true,
                linkDistance: 400,
            },

            modes: {
                // default: ['drag-canvas', 'zoom-canvas', 'drag-node', 'drag-combo'],
                /** default: ['drag-canvas', 'zoom-canvas', 'drag-node', 'drag-combo'],
                 drag-node : 可拖拽节点
                 drag-canvas: 可拖拽画布  当有配置项时，和其他效果写在一个type: [] 中，没效果， ？？可能某些项相斥
                 */
                default: [
                    {
                        type: 'drag-node',
                        enableDelegate: true,
                        activeState: 'actived',
                        plugins: [minimap],
                        shouldUpdate: (e) => {
                            // 不允许 id 为 'combo1' 的 combo 被拖拽
                            // if (e.item && e.item.getModel().id === 'node1') return false;
                            return true;
                        },
                    },
                    {
                        type: 'drag-canvas',
                        brush: [
                            {
                                type: 'brush-select',
                                trigger: 'drag',
                            },
                        ],
                        direction:'both',
                    },
                    // click-select 没效果
                    {
                        type: 'click-select',
                        trigger: 'ctrl',
                        shouldBegin: (e) => {
                            return true;
                        },
                        shouldUpdate: (e) => {
                            // 不允许 id 为 'combo1' 的 combo 被拖拽
                            // if (e.item && e.item.getModel().id === 'node1') return false;
                            return true;
                        },
                    },
                    {
                        type: 'activate-relations',
                        resetSelected: true,
                        trigger: 'mouseenter',
                        activeState: 'active',
                        shouldBegin: (e) => {
                            return true;
                        },
                        shouldUpdate: (e) => {
                            // 不允许 id 为 'combo1' 的 combo 被拖拽
                            // if (e.item && e.item.getModel().id === 'node1') return false;
                            return true;
                        },
                    },
                ],
            },
            // drag-combo : 可能版本低，没有效果
            // comboStateStyles: {
            //     actived: {
            //         stroke: 'red',
            //         lineWidth: 3,
            //     },
            // },
        nodeStateStyles: {
            hover: {
                stroke: 'red',
                lineWidth: 2,
            }
        },
        edgeStateStyles: {
                hover: {
                    stroke: 'blue',
                    lineWidth:3
                }
        }

        }

    );

    graph.data(remoteData); // 加载远程数据
    graph.render(); // 渲染

    graph.on('node:mouseenter', evt => {
        graph.setItemState(evt.item, 'hover', true)

    });
    graph.on('node:mouseleave', evt => {
        // 当前操作的节点 item
        graph.setItemState(evt.item, 'hover', false)
    });
    graph.on('edge:mouseenter', evt => {
        graph.setItemState(evt.item, 'hover', true)

    });
    graph.on('edge:mouseleave', evt => {
        // 当前操作的节点 item
        graph.setItemState(evt.item, 'hover', false)
    });
};
main();
