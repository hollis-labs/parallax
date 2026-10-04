package demoplugin

import (
	"encoding/json"
	"github.com/hollis-labs/plugin-sdk/registry"
	"net/http/httptest"
	"testing"
)

func TestRealRegistryAndReviewedBundle(t *testing.T) {
	d, err := Delivery()
	if err != nil {
		t.Fatal(err)
	}
	w := httptest.NewRecorder()
	d.ServeHTTP(w, httptest.NewRequest("GET", "/plugins/registry", nil))
	var r registry.Response
	if err := json.Unmarshal(w.Body.Bytes(), &r); err != nil {
		t.Fatal(err)
	}
	if len(r.Contributions) != 4 || len(r.Contributions["slot"]) != 3 {
		t.Fatal("widget/panel/presentation actions missing")
	}
	w = httptest.NewRecorder()
	d.ServeHTTP(w, httptest.NewRequest("GET", r.Plugins["ops"].BundleURL, nil))
	if w.Code != 200 || registry.BundleDigest(w.Body.Bytes()) != r.Plugins["ops"].BundleVersion {
		t.Fatal("reviewed bytes mismatch")
	}
}
