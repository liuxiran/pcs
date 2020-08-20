clusterDestroy = {dialog: {}, submit: {}};


clusterDestroy.dialog.create = function(){
  var clusterNameList = get_checked_ids_from_nodelist("cluster_list");

  var prompt = $.i18n("selectOneCluster");
  if (clusterNameList.length < 1) {
    alert(prompt);
    return;
  }

  if (clusterNameList.length > 1) {
    alert($.i18n("destroyMultipleClustersErr") + prompt);
    return;
  }

  var clusterName = clusterNameList[0];

  var destroyAllSupportingClusters = Pcs.clusterController
    .get("cluster_list")
    .get("content")
    .filter(function(cluster){return cluster.isCapable("cluster.destroy.all")})
    .map(function(cluster){return cluster.get("name")})
  ;

  if (!destroyAllSupportingClusters.includes(clusterName)) {
    alert(
      "Cluster '"+clusterName+"' does not support a whole cluster destroy."
      +"\nYou can remove all nodes to destroy this cluster."
    );
    return;
  }


  verify_remove(
    function(){ clusterDestroy.submit.run(clusterName) },
    false, // forceable
    undefined, // checklist_id
    "dialog_verify_destroy_cluster", // dialog_id
    "cluster", // label
    "Destroy Cluster", // ok_text
    "Cluster Destroy", // title_
    clusterName,
  );
};

clusterDestroy.dialog.close = tools.dialog.close(
  "#dialog_verify_destroy_cluster",
  "destroy",
);


clusterDestroy.submit.run = function(clusterName){
  api.clusterDestroy(
    clusterName

  ).then(function(){
    clusterDestroy.dialog.close();
    Pcs.update();

  }).fail(function(rejectCode, data){
    switch(rejectCode){
      case api.err.CLUSTER_DESTROY.FAILED:
        clusterDestroy.dialog.close();
        tools.submit.onCallFail(
          function(msgs){
            alert(msgs.map(function(msg){ return msg.msg }).join("\n"));
          }
        )(
          data.XMLHttpRequest
        );
    }
  });
};
